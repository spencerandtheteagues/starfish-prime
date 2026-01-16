/**
 * Subscription Screen
 *
 * Premium subscription management with stunning visuals,
 * animated cards, and seamless purchase flow.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CaregiverStackParamList, SubscriptionProduct, Subscription } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import {
  SUBSCRIPTION_PRODUCTS,
  TIER_FEATURES,
  TRIAL_CONFIG,
  purchaseProduct,
  restorePurchases,
  getCurrentSubscription,
  formatPrice,
  getStatusDisplayText,
  getDaysRemaining,
  initializePayments,
  getTrialStatus,
  startFreeTrial,
} from '../../services/payments';
import { FamilyColors } from '../../design/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SubscriptionScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'Subscription'>;
};

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionProduct | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [isTrialEligible, setIsTrialEligible] = useState(false);
  const [isOnTrial, setIsOnTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [startingTrial, setStartingTrial] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    initializeScreen();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const initializeScreen = async () => {
    try {
      await initializePayments();
      if (user?.uid) {
        const subscription = await getCurrentSubscription(user.uid);
        setCurrentSubscription(subscription);

        // Check trial status
        const trialStatus = await getTrialStatus(user.uid);
        setIsTrialEligible(trialStatus.isEligible);
        setIsOnTrial(trialStatus.isOnTrial);
        if (trialStatus.daysRemaining !== undefined) {
          setTrialDaysRemaining(trialStatus.daysRemaining);
        }
      }
      // Pre-select popular product
      const popular = SUBSCRIPTION_PRODUCTS.find(p => p.popular);
      setSelectedProduct(popular || SUBSCRIPTION_PRODUCTS[0]);
    } catch (error) {
      console.error('Failed to initialize subscription screen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    if (!user?.uid) return;

    setStartingTrial(true);
    try {
      const trial = await startFreeTrial(user.uid);
      if (trial) {
        setCurrentSubscription(trial);
        setIsOnTrial(true);
        setIsTrialEligible(false);
        setTrialDaysRemaining(TRIAL_CONFIG.durationDays);
        Alert.alert(
          'Trial Started!',
          `Enjoy ${TRIAL_CONFIG.durationDays} days of free premium access to Sunny AI and all features.`,
          [{ text: 'Start Exploring', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Unable to Start Trial', 'You may have already used your free trial.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start trial');
    } finally {
      setStartingTrial(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct || !user?.uid) return;

    setPurchasing(true);
    try {
      const success = await purchaseProduct(selectedProduct.productId);
      if (success) {
        Alert.alert(
          'Purchase Successful',
          `Welcome to ${selectedProduct.name}! Your subscription is now active.`,
          [{ text: 'Great!', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      Alert.alert('Purchase Failed', error.message || 'Please try again later.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert('Purchases Restored', 'Your previous purchases have been restored.');
        // Refresh subscription status
        if (user?.uid) {
          const subscription = await getCurrentSubscription(user.uid);
          setCurrentSubscription(subscription);
        }
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
      }
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Please try again later.');
    } finally {
      setRestoring(false);
    }
  };

  const renderCurrentSubscription = () => {
    if (!currentSubscription) return null;

    const daysRemaining = getDaysRemaining(currentSubscription.endDate);

    return (
      <Animated.View
        style={[
          styles.currentSubscriptionCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.currentSubscriptionGradient}
        >
          <View style={styles.currentSubscriptionHeader}>
            <Icon name="crown" size={28} color="#FCD34D" />
            <View style={styles.currentSubscriptionInfo}>
              <Text style={styles.currentSubscriptionTitle}>
                {currentSubscription.tier === 'premium' ? 'Premium' : 'Basic'} Member
              </Text>
              <Text style={styles.currentSubscriptionStatus}>
                {getStatusDisplayText(currentSubscription.status)}
              </Text>
            </View>
            <View style={styles.daysRemainingBadge}>
              <Text style={styles.daysRemainingText}>{daysRemaining}</Text>
              <Text style={styles.daysRemainingLabel}>days</Text>
            </View>
          </View>
          {currentSubscription.autoRenew && (
            <Text style={styles.renewalText}>
              Renews on {currentSubscription.endDate.toLocaleDateString()}
            </Text>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderProductCard = (product: SubscriptionProduct, index: number) => {
    const isSelected = selectedProduct?.id === product.id;
    const isPremium = product.tier === 'premium';

    const cardStyle = {
      opacity: fadeAnim,
      transform: [
        { translateY: slideAnim },
        { scale: isSelected ? 1 : 0.98 },
      ],
    };

    return (
      <Animated.View key={product.id} style={cardStyle}>
        <TouchableOpacity
          style={[styles.productCard, isSelected && styles.productCardSelected]}
          onPress={() => setSelectedProduct(product)}
          activeOpacity={0.9}
        >
          {product.popular && (
            <View style={styles.popularBadge}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.popularBadgeGradient}
              >
                <Icon name="star" size={12} color="#FFFFFF" />
                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
              </LinearGradient>
            </View>
          )}

          <LinearGradient
            colors={
              isSelected
                ? isPremium
                  ? ['#7C3AED', '#5B21B6']
                  : ['#3B82F6', '#1D4ED8']
                : ['#FFFFFF', '#F9FAFB']
            }
            style={styles.productCardGradient}
          >
            {/* Selection indicator */}
            <View style={styles.selectionIndicator}>
              <View
                style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterSelected,
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </View>

            {/* Product info */}
            <View style={styles.productInfo}>
              <Text
                style={[
                  styles.productName,
                  isSelected && styles.productNameSelected,
                ]}
              >
                {product.name}
              </Text>
              <Text
                style={[
                  styles.productDescription,
                  isSelected && styles.productDescriptionSelected,
                ]}
              >
                {product.description}
              </Text>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text
                style={[
                  styles.priceAmount,
                  isSelected && styles.priceAmountSelected,
                ]}
              >
                {formatPrice(product.priceUsd)}
              </Text>
              <Text
                style={[
                  styles.pricePeriod,
                  isSelected && styles.pricePeriodSelected,
                ]}
              >
                {product.billingPeriod === 'lifetime'
                  ? 'one-time'
                  : `/${product.billingPeriod === 'monthly' ? 'mo' : 'yr'}`}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFeaturesList = () => {
    if (!selectedProduct) return null;

    return (
      <Animated.View
        style={[
          styles.featuresSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.featuresSectionTitle}>What's Included</Text>
        {selectedProduct.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.featureIcon}
            >
              <Icon name="check" size={14} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#F5F3FF', '#EDE9FE', '#DDD6FE']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={FamilyColors.primary.purple} />
        <Text style={styles.loadingText}>Loading subscription options...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#F5F3FF', '#EDE9FE', '#DDD6FE']}
        style={styles.backgroundGradient}
      />

      {/* Decorative elements */}
      <View style={styles.decorativeContainer}>
        <View style={[styles.decorativeCircle, styles.decorativeCircle1]} />
        <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={restoring}
          >
            {restoring ? (
              <ActivityIndicator size="small" color={FamilyColors.primary.purple} />
            ) : (
              <Text style={styles.restoreButtonText}>Restore</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Free Trial Banner */}
          {isTrialEligible && (
            <Animated.View
              style={[
                styles.trialBanner,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.trialBannerGradient}
              >
                <View style={styles.trialBannerContent}>
                  <View style={styles.trialBannerIcon}>
                    <Icon name="gift" size={32} color="#FCD34D" />
                  </View>
                  <View style={styles.trialBannerText}>
                    <Text style={styles.trialBannerTitle}>
                      Start Your {TRIAL_CONFIG.durationDays}-Day Free Trial
                    </Text>
                    <Text style={styles.trialBannerSubtitle}>
                      Full premium access. No credit card required.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.trialButton}
                  onPress={handleStartTrial}
                  disabled={startingTrial}
                >
                  {startingTrial ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <Text style={styles.trialButtonText}>Start Free Trial</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Trial Status Banner */}
          {isOnTrial && (
            <Animated.View
              style={[
                styles.trialStatusBanner,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['#FEF3C7', '#FDE68A']}
                style={styles.trialStatusGradient}
              >
                <Icon name="clock-outline" size={24} color="#D97706" />
                <View style={styles.trialStatusText}>
                  <Text style={styles.trialStatusTitle}>
                    {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left in trial
                  </Text>
                  <Text style={styles.trialStatusSubtitle}>
                    Subscribe now to keep your premium access
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#7C3AED', '#5B21B6', '#4C1D95']}
              style={styles.heroGradient}
            >
              <View style={styles.heroIconContainer}>
                <Icon name="robot-happy" size={48} color="#FCD34D" />
              </View>
              <Text style={styles.heroTitle}>Unlock Sunny AI</Text>
              <Text style={styles.heroSubtitle}>
                Your loved one's 24/7 voice-activated companion
              </Text>
              {isTrialEligible && (
                <View style={styles.heroTrialBadge}>
                  <Icon name="star" size={14} color="#FCD34D" />
                  <Text style={styles.heroTrialText}>
                    {TRIAL_CONFIG.durationDays}-DAY FREE TRIAL
                  </Text>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Current subscription */}
          {renderCurrentSubscription()}

          {/* Product cards */}
          <View style={styles.productsContainer}>
            {SUBSCRIPTION_PRODUCTS.map((product, index) =>
              renderProductCard(product, index)
            )}
          </View>

          {/* Features list */}
          {renderFeaturesList()}

          {/* Terms */}
          <Animated.View
            style={[
              styles.termsContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.termsText}>
              Subscription automatically renews unless canceled at least 24 hours
              before the end of the current period. Manage subscriptions in your
              Apple ID account settings.
            </Text>
            <View style={styles.termsLinks}>
              <TouchableOpacity>
                <Text style={styles.termsLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.termsDivider}>|</Text>
              <TouchableOpacity>
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Purchase button */}
        <Animated.View
          style={[
            styles.purchaseButtonContainer,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              (!selectedProduct || purchasing) && styles.purchaseButtonDisabled,
            ]}
            onPress={handlePurchase}
            disabled={!selectedProduct || purchasing}
          >
            <LinearGradient
              colors={
                selectedProduct && !purchasing
                  ? ['#7C3AED', '#5B21B6']
                  : ['#9CA3AF', '#6B7280']
              }
              style={styles.purchaseButtonGradient}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.purchaseButtonText}>
                    {selectedProduct
                      ? `Subscribe for ${formatPrice(selectedProduct.priceUsd)}${
                          selectedProduct.billingPeriod === 'monthly' ? '/mo' : ''
                        }`
                      : 'Select a plan'}
                  </Text>
                  <Icon name="arrow-right" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.4,
  },
  decorativeCircle1: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    backgroundColor: '#A78BFA',
    top: -SCREEN_WIDTH * 0.3,
    right: -SCREEN_WIDTH * 0.3,
  },
  decorativeCircle2: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    backgroundColor: '#C4B5FD',
    bottom: SCREEN_WIDTH * 0.1,
    left: -SCREEN_WIDTH * 0.2,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  restoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.primary.purple,
  },
  content: {
    padding: 20,
  },
  heroSection: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E9D5FF',
    textAlign: 'center',
  },
  heroTrialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  heroTrialText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FCD34D',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  trialBanner: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  trialBannerGradient: {
    padding: 20,
  },
  trialBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trialBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trialBannerText: {
    flex: 1,
  },
  trialBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trialBannerSubtitle: {
    fontSize: 14,
    color: '#A7F3D0',
  },
  trialButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  trialButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  trialStatusBanner: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trialStatusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  trialStatusText: {
    marginLeft: 12,
    flex: 1,
  },
  trialStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
  },
  trialStatusSubtitle: {
    fontSize: 13,
    color: '#92400E',
    marginTop: 2,
  },
  currentSubscriptionCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  currentSubscriptionGradient: {
    padding: 20,
  },
  currentSubscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentSubscriptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currentSubscriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentSubscriptionStatus: {
    fontSize: 14,
    color: '#A7F3D0',
    marginTop: 2,
  },
  daysRemainingBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  daysRemainingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  daysRemainingLabel: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: -2,
  },
  renewalText: {
    fontSize: 13,
    color: '#A7F3D0',
    marginTop: 12,
  },
  productsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  productCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productCardSelected: {
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  productCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: 16,
    zIndex: 10,
  },
  popularBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  selectionIndicator: {
    marginRight: 16,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  productNameSelected: {
    color: '#FFFFFF',
  },
  productDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  productDescriptionSelected: {
    color: '#E9D5FF',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  priceAmountSelected: {
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: 13,
    color: '#6B7280',
  },
  pricePeriodSelected: {
    color: '#E9D5FF',
  },
  featuresSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  featuresSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#4B5563',
    flex: 1,
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  termsLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsLink: {
    fontSize: 12,
    color: FamilyColors.primary.purple,
    fontWeight: '600',
  },
  termsDivider: {
    color: '#D1D5DB',
    marginHorizontal: 12,
  },
  bottomPadding: {
    height: 100,
  },
  purchaseButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  purchaseButtonDisabled: {
    shadowOpacity: 0.1,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default SubscriptionScreen;

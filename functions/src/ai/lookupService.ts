export async function performLookup(query: string, category: string) {
  // Simple lookup service
  // In a real app, this might query an external API or a local database of resources
  const blockedCategories = ['medical_advice', 'legal_advice', 'financial_advice'];
  
  if (blockedCategories.includes(category)) {
    return { error: 'Category not allowed for lookup' };
  }

  return { result: `Information about ${query} in ${category}` };
}

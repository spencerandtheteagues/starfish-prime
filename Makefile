.PHONY: up smoke down preview asvs logs

up:
	cp -n .env.example .env || true
	docker compose up -d --build

smoke:
	./scripts/smoke.sh

down:
	docker compose down -v

preview:
	./scripts/preview-up.sh

asvs:
	./scripts/asvs.sh

logs:
	docker compose logs -f --tail=200

CMD = docker-compose -f infra/docker-compose.yml -p app
all: build up

build:
	$(CMD) build

up:
	$(CMD) up -d

down:
	$(CMD) down

clean:
	$(CMD) down -v

ps:
	$(CMD) ps

fclean: down
	$(CMD) down --rmi all -v --remove-orphans
	docker system prune -af
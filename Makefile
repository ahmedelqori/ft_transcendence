CMD = docker-compose -f ./infra/docker-compose.yml -p app

up:
	$(CMD) up -d
	
down:
	$(CMD) down


stop:
	$(CMD) stop

re: down up

rebuild: clean up

fullrebuild: fclean up

ps:
	$(CMD) ps -a

logs:
	$(CMD) logs $(c)

status:
	@bash ./infra/tools/status.sh

shell:
	$(CMD) exec $(c) bash

clean:
	$(CMD) down --rmi all

fclean: down
	$(CMD) down --rmi all -v --remove-orphans
	docker system prune -af
	# docker volume prune -f
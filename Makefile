# CMD = docker-compose -f ./infra/docker-compose.yml -p app

# up:
# 	$(CMD) up -d
	
# down:
# 	$(CMD) down

# stop:
# 	$(CMD) stop

# re: down up

# rebuild: clean up

# fullrebuild: fclean up

# ps:
# 	$(CMD) ps -a
	

# logs:
# 	$(CMD) logs -f $(c)

# status:
# 	@bash ./infra/tools/status.sh

# clean:
# 	$(CMD) down --rmi all

# fclean: down
# 	$(CMD) down --rmi all -v --remove-orphans
# 	docker system prune -af
# 	docker volume prune -af

# shell:
# 	$(CMD) exec $(c) sh

# restart:
# 	docker container stop $(c)
# 	docker container rm $(c)
# 	docker rmi app_$(c) -f
# 	$(CMD) up -d
# # docker container ls | grep $(c) | awk '{print $$1}' | xargs docker container stop


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
	$(CMD) logs -f $(c)

status:
	@bash ./infra/tools/status.sh

clean:
	$(CMD) down --rmi all

fclean: down
	$(CMD) down --rmi all -v --remove-orphans
	docker system prune -af
	docker volume prune -f

#!!!!!!!!!!!!!!!!! rules for devlopment !!!!!!!!!!!!!!!!!!#

shell:
	$(CMD) exec $(c) bash

restart:
	docker container stop $(c)
	docker container rm $(c)
	docker image rm app_$(c)
	$(CMD) up -d
# docker container ls | grep $(c) | awk '{print $$1}' | xargs docker container stop
# Docker Compose Commands
up:
	@docker-compose up --build -d

down:
	@docker-compose down

stop:
	@docker-compose stop

re: down up

ps:
	@docker-compose ps -a

logs:
	@docker-compose logs $(c)

status:
	@bash ./others/tools/status.sh

shell:
	@docker-compose exec $(c) bash

clean:
	@docker-compose down --rmi all
	@#docker container rm -f $(docker container ls -qa)

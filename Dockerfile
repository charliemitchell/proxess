FROM ubuntu

RUN apt-get update -y
	
RUN	apt-get install -y nodejs-legacy npm mongodb git

RUN npm install -g ember-cli bower

ADD package.json /var/www/package.json

RUN cd /var/www && npm install

ADD client/package.json /var/www/client/package.json

RUN cd /var/www/client && npm install

ADD client/bower.json /var/www/client/bower.json

RUN cd /var/www/client && bower install --allow-root

ADD . /var/www

WORKDIR /var/www

RUN cd client && ember build

EXPOSE 9911

CMD ["sh", "init.sh"]
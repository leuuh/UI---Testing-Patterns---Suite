FROM cypress/base:20.9.0

WORKDIR /home/cypress

RUN mkdir -p /usr/share/man/man1 && \
    apt-get update && \
    apt-get install -y --fix-missing default-jre && \
    rm -rf /var/lib/apt/lists/*

COPY . /home/cypress/

VOLUME [ "/home/cypress/allure-report" ]

RUN npm install

CMD ["npm", "run", "test"]
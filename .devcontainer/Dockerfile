FROM amd64/rust:latest

WORKDIR /near/

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && npm install --global yarn

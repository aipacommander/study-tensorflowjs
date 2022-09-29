# study-tensorflowjs

## Usage


```bash
$ docker run --rm -it -v $(pwd):/app -w /app/nuxt-app -p 4000:4000 -p 24678:24678 --platform linux/arm64/v8 --name study-tensorflowjs node:16.11.0-slim /bin/bash -c "yarn dev -o -- --port 4000"
```

## Install

```bash
$ docker run --rm -it -v $(pwd):/app -w /app -p 4000:4000 --platform linux/arm64/v8 --name study-tensorflowjs node:16.11.0-slim /bin/bash
# apt update -y && apt install -y gcc g++ make python3
# cd nuxt-app/
# yarn install
# yarn dev -o   # 起動確認
```

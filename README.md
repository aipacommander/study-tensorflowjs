# study-tensorflowjs

## Usage

```bash
$ docker run --rm -it -v $(pwd):/app -w /app -p 4000:4000 --platform linux/arm64/v8 --name study-tensorflowjs node:17.0-slim /bin/bash
# apt install -y && apt install -y gcc g++ make python3
# env HOST=0 NODE_OPTIONS=--openssl-legacy-provider yarn dev -- --port 4000
```

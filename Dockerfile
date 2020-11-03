FROM node:13-alpine AS builder
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build


FROM node:13-alpine
WORKDIR /app
COPY --from=builder /app ./

CMD ["npm", "run", "start:prod"] 

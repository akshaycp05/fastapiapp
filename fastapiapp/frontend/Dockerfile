# 1. Use the official Node.js image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# 4. Copy the rest of our application source code
COPY . .

# 5. Document that the container listens on port 5173 (Vite's default port)
EXPOSE 5173

# 6. Start Vite and bind it to 0.0.0.0 so we can access it outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
# # React frontend Dockerfile
# FROM node:18

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# EXPOSE 3000
# CMD ["npm", "start"]

# Use Nginx image to serve static files
FROM nginx:alpine

# Remove the default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the React build output into Nginx's static folder
COPY build/ /usr/share/nginx/html

# Copy a custom Nginx config (optional, for routing support)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

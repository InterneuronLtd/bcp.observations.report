# Use the official NGINX image as base
FROM nginx:latest

# Copy the static content of your website into the NGINX default public directory
COPY ./buildfolder_modules /usr/share/nginx/html
COPY ./modules.default.conf /etc/nginx/conf.d/default.conf
# Expose port 80 to allow external access
EXPOSE 80

# Start NGINX when the container starts
CMD ["nginx", "-g", "daemon off;"]
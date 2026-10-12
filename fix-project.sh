echo "Fixing projects.json..."
rm -f database/projects.json

echo "Creating empty JavaScript files..."
touch js/auth.js
touch js/budget.js
touch js/components.js
touch js/inventory.js
touch js/project-matcher.js
touch js/storage.js

echo "Project structure fixed successfully."

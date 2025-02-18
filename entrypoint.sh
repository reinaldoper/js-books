
export DATABASE_URL="mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"


npx prisma db push
npx prisma migrate deploy
node src/index.js
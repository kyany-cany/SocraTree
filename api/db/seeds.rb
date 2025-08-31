# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
User.create!(
  email: "test@example.com",
  password: "password",
  password_confirmation: "password"
)

uid = ENV.fetch("FRONT_OAUTH_UID", "Nea5B3HT2rapVdGQ9pHTFlc4Mh4q8uLAzbjF2UG5UPU")

Doorkeeper::Application.find_or_create_by!(uid: uid) do |a|
  a.name         = "Front SPA"
  a.redirect_uri = ENV.fetch("FRONT_OAUTH_REDIRECT", "http://localhost:5173/callback")
  a.scopes       = "user"
  a.confidential = false
end
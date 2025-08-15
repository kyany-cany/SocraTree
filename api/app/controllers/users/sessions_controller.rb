# app/controllers/users/sessions_controller.rb
class Users::SessionsController < ApplicationController
    # ApplicationController は ActionController::API 継承のはず
    include Devise::Controllers::Helpers
    include ActionController::RequestForgeryProtection
  
    # SPA からの POST では CSRF トークンが無いので create だけ無効化
    skip_forgery_protection only: :create
  
    def create
      email = params.dig(:user, :email)
      password = params.dig(:user, :password)
  
      user = User.find_for_database_authentication(email: email)
      if user&.valid_password?(password)
        sign_in(user) # セッションCookieが発行される
        render json: { message: "signed in" }, status: :ok
      else
        render json: { error: "invalid credentials" }, status: :unauthorized
      end
    end
  end
  
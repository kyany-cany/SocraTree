class ApplicationController < ActionController::API
    include ActionController::Cookies
    include ActionController::RequestForgeryProtection
    include Devise::Controllers::Helpers 

    protect_from_forgery with: :exception
end

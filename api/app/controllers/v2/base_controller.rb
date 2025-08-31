module V2
  class BaseController < ActionController::API
    before_action :require_user_scope

    private
    def require_user_scope
      doorkeeper_authorize! :user
    end

    def current_user
      uid = doorkeeper_token&.resource_owner_id
      @current_user ||= User.find(uid) if uid
    end
  end
end

module V2
    class BaseController < ActionController::API
      before_action :doorkeeper_authorize!
      private
      def current_user
        uid = doorkeeper_token&.resource_owner_id
        @current_user ||= User.find(uid) if uid
      end
    end
end
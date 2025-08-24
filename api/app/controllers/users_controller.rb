class UsersController < ApplicationController
    before_action -> { doorkeeper_authorize! :user }   # scope が "user" なら

    # APIならCSRF無効化（Cookie使わないため）
    skip_before_action :verify_authenticity_token
  
    def me
      user = User.find(doorkeeper_token.resource_owner_id)
      render json: {
        id: user.id,
        email:  user.email,
        research_consent: user.research_consent,
        research_consent_version: user.research_consent_version,
      }
    end
  end
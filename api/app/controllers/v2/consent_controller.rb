# app/controllers/v2/consent_controller.rb
module V2
  class ConsentController < ApplicationController
    before_action -> { doorkeeper_authorize! :user }
    skip_before_action :verify_authenticity_token

    def create
      user    = User.find(doorkeeper_token.resource_owner_id)
      consent = ActiveModel::Type::Boolean.new.cast(params[:research_consent])
      version = params[:research_consent_version].presence || "v1"
      user.update!(
        research_consent:         consent,
        research_consent_at:      Time.current,
        research_consent_version: version
      )
      head :no_content
    end
  end
end

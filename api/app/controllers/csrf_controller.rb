# app/controllers/csrf_controller.rb
class CsrfController < ApplicationController
    # skip_before_action :verify_authenticity_token, only: :show # ここは任意
    def show
      render json: { csrfToken: form_authenticity_token }
    end
  end
  
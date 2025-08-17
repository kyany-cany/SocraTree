class DebugController < ApplicationController
    def session_info
      render json: {
        cookie_present: cookies['_session'].present?,
        session_id: request.session.id,
        warden_user_key: request.session['warden.user.user.key']
      }
    end
end
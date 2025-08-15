Rails.application.config.session_store :cookie_store,
  key: '_session',
  same_site: :none, 
  secure: true       

Rails.application.routes.draw do
  use_doorkeeper
  # devise_for :users
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # use_doorkeeper # ← Doorkeeper のルート追加（/oauth/authorize, /oauth/token など）

  use_doorkeeper do
    controllers authorizations: 'custom/authorizations'
  end

  # Defines the root path route ("/")
  # root "posts#index"
  devise_for :users,
    controllers: { sessions: "users/sessions" },
    defaults: { format: :json }

  get "/me", to: "users#me"
  get "/debug/session", to: "debug#session_info"

  resource :csrf, only: :show, controller: "csrf"

  resource :consent, only: [:create], controller: "consent"

  resources :chats, only: [:index, :destroy] do
    patch :archive, on: :member
    patch :restore, on: :member
    resources :messages, only: [:index, :create] do
      post :reload, on: :member
    end
  end


  resources :messages, only: [:index, :create]
end

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  use_doorkeeper
  # devise_for :users
  devise_for :users, controllers: {
    sessions: 'users/sessions'
  }

  scope :api, defaults: { format: :json } do
    resources :conversations, only: [:create, :show] do
      resources :messages, only: [:index, :create]
    end
    get 'me', to: 'me#show'
  end
end

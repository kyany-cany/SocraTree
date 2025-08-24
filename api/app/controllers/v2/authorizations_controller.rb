module Custom
    class AuthorizationsController < Doorkeeper::AuthorizationsController
      before_action :store_research_consent, only: :create
  
      # 承認処理（「同意」「同意しない」どちらもここに来る）
      def create
        super # ← ここで通常どおり code を発行し redirect_uri へ返す
      end
  
      private
  
      def store_research_consent
        return unless params.key?(:research_consent)
  
        user = respond_to?(:current_user) ? current_user : nil
        return unless user
  
        consent_bool = ActiveModel::Type::Boolean.new.cast(params[:research_consent])
        user.update(
          research_consent: consent_bool,
          research_consent_at: Time.current,
          research_consent_version: 'v1'
        )
      end
    end
  end
  
class Company < ActiveRecord::Base
  has_paper_trail

  has_many :users, :through => :memberships
  has_many :active_users, -> { where(archived: false) }, through: :memberships
  has_many :memberships, :dependent => :destroy

  has_many :projects, dependent: :destroy
  has_many :assignments, through: :projects
  has_many :clients, dependent: :destroy
  has_many :invites, dependent: :destroy

  validates_presence_of :name
  validates_uniqueness_of :name

  # Goes as follows:
  # We're deleting a company. Before that happens, we'll take all that company's users
  # and set their current_company_id to any other company they're a member of, or to
  # nil if they don't have any left beyond the one we're deleting
  before_destroy do |record|
    record.users.where(current_company_id: record.id).all.each do |user|
      user.current_company_id = user.company_ids.reject { |c| c == record.id }.first
      user.save
    end
  end

  def self.all_with_users_and_projects
    Jbuilder.encode do |json|
      json.companies self.all do |json, company|
        json.(company, :name)
        json.users company.users do |json, user|
          json.(user, :id, :first_name, :last_name)
          json.project_ids user.assignments.map(&:project_id)
        end
        json.projects company.projects do |json, project|
          json.(project, :id, :name)
          json.client_name project.client.name.strip
          json.user_ids project.users.map(&:id)
        end
      end
    end
  end

  def assignments
    Assignment.where(:user_id => self.users.map(&:id), :project_id => self.projects.map(&:id))
  end

  def total_recap_for_date_range(lower, upper)
    {}.tap do |recap|
      projects.each do |project|
        recap.store(project.id, project.work_week_totals_for_date_range(lower, upper))
      end
    end
  end

  def active_users
    User.where(id: memberships.where(archived: false).where(disabled: false).select('memberships.user_id').pluck(:user_id))
  end

  def inactive_users
    User.where(id: memberships.select { |m| m.archived? or m.disabled? }.map(&:user_id))
  end
end

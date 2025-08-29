import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { NamedLink, LayoutSingleColumn } from '../../components';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import css from './ModernLandingPage.module.css';

const ModernLandingPage = () => {
  return (
    <LayoutSingleColumn
      topbar={<TopbarContainer />}
      footer={<FooterContainer />}
    >
      <div className={css.root}>
      {/* Hero Section */}
      <section className={css.hero}>
        <div className={css.heroContent}>
          <div className={css.heroText}>
            <h1 className={css.heroTitle}>
              <FormattedMessage 
                id="ModernLandingPage.heroTitle" 
                defaultMessage="Share Tools, Build Together"
              />
            </h1>
            <p className={css.heroSubtitle}>
              <FormattedMessage 
                id="ModernLandingPage.heroSubtitle" 
                defaultMessage="Join the UK's premier DIY tool sharing community. Rent tools from neighbors, share your collection, and tackle any project with confidence."
              />
            </p>
            <div className={css.heroActions}>
              <NamedLink name="SearchPage" className={css.primaryButton}>
                <FormattedMessage 
                  id="ModernLandingPage.findTools" 
                  defaultMessage="Find Tools"
                />
              </NamedLink>
              <NamedLink name="NewListingPage" className={css.secondaryButton}>
                <FormattedMessage 
                  id="ModernLandingPage.listTools" 
                  defaultMessage="List Your Tools"
                />
              </NamedLink>
            </div>
          </div>
          <div className={css.heroVisual}>
            <div className={css.heroImage}>
              <div className={css.toolGrid}>
                <div className={css.toolCard}>🔨</div>
                <div className={css.toolCard}>🔧</div>
                <div className={css.toolCard}>🪜</div>
                <div className={css.toolCard}>⚡</div>
                <div className={css.toolCard}>🌱</div>
                <div className={css.toolCard}>🛠️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={css.features}>
        <div className={css.container}>
          <h2 className={css.sectionTitle}>
            <FormattedMessage 
              id="ModernLandingPage.whyChooseUs" 
              defaultMessage="Why Choose DIY Tool Share?"
            />
          </h2>
          <div className={css.featuresGrid}>
            <div className={css.featureCard}>
              <div className={css.featureIcon}>💰</div>
              <h3 className={css.featureTitle}>
                <FormattedMessage 
                  id="ModernLandingPage.saveMoney" 
                  defaultMessage="Save Money"
                />
              </h3>
              <p className={css.featureDescription}>
                <FormattedMessage 
                  id="ModernLandingPage.saveMoneyDesc" 
                  defaultMessage="Rent tools instead of buying. Pay only for what you need, when you need it."
                />
              </p>
            </div>
            <div className={css.featureCard}>
              <div className={css.featureIcon}>🌍</div>
              <h3 className={css.featureTitle}>
                <FormattedMessage 
                  id="ModernLandingPage.ecoFriendly" 
                  defaultMessage="Eco-Friendly"
                />
              </h3>
              <p className={css.featureDescription}>
                <FormattedMessage 
                  id="ModernLandingPage.ecoFriendlyDesc" 
                  defaultMessage="Reduce waste by sharing resources. Every shared tool helps the environment."
                />
              </p>
            </div>
            <div className={css.featureCard}>
              <div className={css.featureIcon}>🤝</div>
              <h3 className={css.featureTitle}>
                <FormattedMessage 
                  id="ModernLandingPage.community" 
                  defaultMessage="Build Community"
                />
              </h3>
              <p className={css.featureDescription}>
                <FormattedMessage 
                  id="ModernLandingPage.communityDesc" 
                  defaultMessage="Connect with neighbors, share skills, and build lasting relationships."
                />
              </p>
            </div>
            <div className={css.featureCard}>
              <div className={css.featureIcon}>⚡</div>
              <h3 className={css.featureTitle}>
                <FormattedMessage 
                  id="ModernLandingPage.convenient" 
                  defaultMessage="Convenient"
                />
              </h3>
              <p className={css.featureDescription}>
                <FormattedMessage 
                  id="ModernLandingPage.convenientDesc" 
                  defaultMessage="Find tools nearby, book instantly, and get started on your project today."
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={css.howItWorks}>
        <div className={css.container}>
          <h2 className={css.sectionTitle}>
            <FormattedMessage 
              id="ModernLandingPage.howItWorks" 
              defaultMessage="How It Works"
            />
          </h2>
          <div className={css.stepsGrid}>
            <div className={css.step}>
              <div className={css.stepNumber}>1</div>
              <h3 className={css.stepTitle}>
                <FormattedMessage 
                  id="ModernLandingPage.step1Title" 
                  defaultMessage="Search & Find"
                />
              </h3>
              <p className={css.stepDescription}>
                <FormattedMessage 
                  id="ModernLandingPage.step1Desc" 
                  defaultMessage="Browse tools in your area or search for specific items you need."
                />
              </p>
            </div>
            <div className={css.step}>
              <div className={css.stepNumber}>2</div>
              <h3 className={css.stepTitle}>
                <FormattedMessage 
                  id="ModernLandingPage.step2Title" 
                  defaultMessage="Book & Pay"
                />
              </h3>
              <p className={css.stepDescription}>
                <FormattedMessage 
                  id="ModernLandingPage.step2Desc" 
                  defaultMessage="Reserve your dates, pay securely, and confirm your booking."
                />
              </p>
            </div>
            <div className={css.step}>
              <div className={css.stepNumber}>3</div>
              <h3 className={css.stepTitle}>
                <FormattedMessage 
                  id="ModernLandingPage.step3Title" 
                  defaultMessage="Collect & Use"
                />
              </h3>
              <p className={css.stepDescription}>
                <FormattedMessage 
                  id="ModernLandingPage.step3Desc" 
                  defaultMessage="Pick up your tools, complete your project, and return on time."
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={css.cta}>
        <div className={css.container}>
          <div className={css.ctaContent}>
            <h2 className={css.ctaTitle}>
              <FormattedMessage 
                id="ModernLandingPage.readyToStart" 
                defaultMessage="Ready to Start Your Next Project?"
              />
            </h2>
            <p className={css.ctaSubtitle}>
              <FormattedMessage 
                id="ModernLandingPage.joinCommunity" 
                defaultMessage="Join thousands of DIY enthusiasts across the UK"
              />
            </p>
            <div className={css.ctaActions}>
              <NamedLink name="SearchPage" className={css.ctaPrimaryButton}>
                <FormattedMessage 
                  id="ModernLandingPage.browseTools" 
                  defaultMessage="Browse Tools"
                />
              </NamedLink>
              <NamedLink name="SignupPage" className={css.ctaSecondaryButton}>
                <FormattedMessage 
                  id="ModernLandingPage.joinNow" 
                  defaultMessage="Join Now"
                />
              </NamedLink>
            </div>
          </div>
        </div>
      </section>
      </div>
    </LayoutSingleColumn>
  );
};

export default ModernLandingPage;

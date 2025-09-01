import React, { useState, useEffect } from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { NamedLink, LayoutSingleColumn } from '../../components';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import css from './ModernLandingPage.module.css';

const ModernLandingPage = ({ consoleContent }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);
  
  // Extract content from console data
  const sections = consoleContent?.sections || [];
  console.log('sections', sections);
  
  // Find hero section for background image
  const heroSection = sections.find(section => section.sectionType === 'hero');
  const heroBackgroundImage = heroSection?.appearance?.backgroundImage;
  const heroTitle = heroSection?.title?.content;
  const heroDescription = heroSection?.description?.content;
  
  // Find carousel section for articles
  const carouselSection = sections.find(section => section.sectionType === 'carousel');
  const carouselBlocks = carouselSection?.blocks || [];
  
  // Find other sections for images
  const otherSections = sections.filter(section => 
    section.sectionType !== 'hero' && 
    section.sectionType !== 'carousel'
  );

  // Local images for carousel
  const localCarouselImages = [
    {
      image: '/static/images/big-savings.png',
      title: 'Big Savings',
      description: 'Save money by renting tools instead of buying them. Pay only for what you need, when you need it.',
      link: '/s'
    },
    {
      image: '/static/images/diy-for-everyone.png',
      title: 'DIY for Everyone',
      description: 'From beginners to experts, find the tools you need to complete any project with confidence.',
      link: '/s'
    },
    {
      image: '/static/images/garden-diy.png',
      title: 'Garden DIY',
      description: 'Transform your outdoor space with professional garden tools available for rent.',
      link: '/s'
    },
    {
      image: '/static/images/book-shelf.png',
      title: 'Home Projects',
      description: 'Build, repair, and improve your home with quality tools from your neighbors.',
      link: '/s'
    },
    {
      image: '/static/images/garden.png',
      title: 'Garden Projects',
      description: 'Create beautiful outdoor spaces with professional gardening equipment.',
      link: '/s'
    },
    {
      image: '/static/images/kid-hammer.png',
      title: 'Family Projects',
      description: 'Get the whole family involved in DIY projects with safe, quality tools.',
      link: '/s'
    },
    {
      image: '/static/images/man-cave.png',
      title: 'Man Cave Projects',
      description: 'Build the ultimate man cave with professional tools and equipment.',
      link: '/s'
    },
    {
      image: '/static/images/shed-to-sharing.png',
      title: 'Shed to Sharing',
      description: 'Turn your unused tools into income by sharing them with the community.',
      link: '/l/new'
    }
  ];

  // Handle responsive card count
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setCardsPerView(4);
      } else if (width >= 900) {
        setCardsPerView(3);
      } else if (width >= 768) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset current slide when cards per view changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [cardsPerView]);

  // Auto-advance carousel
  useEffect(() => {
    if (localCarouselImages.length > cardsPerView) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          const maxSlides = Math.ceil(localCarouselImages.length / cardsPerView) - 1;
          return prev >= maxSlides ? 0 : prev + 1;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [localCarouselImages.length, cardsPerView]);

  const nextSlide = () => {
    const maxSlides = Math.ceil(localCarouselImages.length / cardsPerView) - 1;
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlides));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <LayoutSingleColumn
      topbar={<TopbarContainer />}
      footer={<FooterContainer />}
    >
      <div className={css.root}>
        {/* Hero Section */}
        <section 
          className={css.hero}
          style={{
            backgroundImage: `url('/static/images/hero.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className={css.heroOverlay}>
            <div className={css.container}>
              <div className={css.heroContent}>
                <div className={css.heroText}>
                  <h1 className={css.heroTitle}>
                    {heroTitle || (
                      <FormattedMessage 
                        id="ModernLandingPage.heroTitle" 
                        defaultMessage="Share Tools, Build Together"
                      />
                    )}
                  </h1>
                  <p className={css.heroSubtitle}>
                    {heroDescription || (
                      <FormattedMessage 
                        id="ModernLandingPage.heroSubtitle" 
                        defaultMessage="Join the UK's premier DIY tool sharing community. Rent tools from neighbors, share your collection, and tackle any project with confidence."
                      />
                    )}
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
                  <div className={css.heroImageGrid}>
                    <div className={css.imageCard}>
                      <div className={css.imagePlaceholder}>
                        <span className={css.toolIcon}>🔨</span>
                      </div>
                      <p className={css.imageCaption}>Power Tools</p>
                    </div>
                    <div className={css.imageCard}>
                      <div className={css.imagePlaceholder}>
                        <span className={css.toolIcon}>🔧</span>
                      </div>
                      <p className={css.imageCaption}>Hand Tools</p>
                    </div>
                    <div className={css.imageCard}>
                      <div className={css.imagePlaceholder}>
                        <span className={css.toolIcon}>🪜</span>
                      </div>
                      <p className={css.imageCaption}>Ladders</p>
                    </div>
                    <div className={css.imageCard}>
                      <div className={css.imagePlaceholder}>
                        <span className={css.toolIcon}>⚡</span>
                      </div>
                      <p className={css.imageCaption}>Electrical</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className={css.quickActions}>
          <div className={css.container}>
            <div className={css.actionsGrid}>
              <div className={css.actionCard}>
                <div className={css.actionImage}>
                  <img 
                    src="/static/images/services-search-listings.png" 
                    alt="Search Tools" 
                    className={css.actionImageSrc}
                  />
                </div>
                <h3 className={css.actionTitle}>
                  <FormattedMessage 
                    id="ModernLandingPage.searchTools" 
                    defaultMessage="Search Tools"
                  />
                </h3>
                <p className={css.actionDescription}>
                  <FormattedMessage 
                    id="ModernLandingPage.searchToolsDesc" 
                    defaultMessage="Browse thousands of tools available in your area"
                  />
                </p>
                <NamedLink name="SearchPage" className={css.actionLink}>
                  <FormattedMessage 
                    id="ModernLandingPage.startSearch" 
                    defaultMessage="Start Searching"
                  />
                </NamedLink>
              </div>
              <div className={css.actionCard}>
                <div className={css.actionImage}>
                  <img 
                    src="/static/images/services-my-listings.png" 
                    alt="List Your Tools" 
                    className={css.actionImageSrc}
                  />
                </div>
                <h3 className={css.actionTitle}>
                  <FormattedMessage 
                    id="ModernLandingPage.listTools" 
                    defaultMessage="List Your Tools"
                  />
                </h3>
                <p className={css.actionDescription}>
                  <FormattedMessage 
                    id="ModernLandingPage.listToolsDesc" 
                    defaultMessage="Earn money by sharing your tools with the community"
                  />
                </p>
                <NamedLink name="NewListingPage" className={css.actionLink}>
                  <FormattedMessage 
                    id="ModernLandingPage.startListing" 
                    defaultMessage="Start Listing"
                  />
                </NamedLink>
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
                <div className={css.featureImage}>
                  <img 
                    src="/static/images/big-savings.png" 
                    alt="Save Money" 
                    className={css.featureImageSrc}
                  />
                </div>
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
                <div className={css.featureImage}>
                  <img 
                    src="/static/images/diy-for-everyone.png" 
                    alt="DIY for Everyone" 
                    className={css.featureImageSrc}
                  />
                </div>
                <h3 className={css.featureTitle}>
                  <FormattedMessage 
                    id="ModernLandingPage.ecoFriendly" 
                    defaultMessage="DIY for Everyone"
                  />
                </h3>
                <p className={css.featureDescription}>
                  <FormattedMessage 
                    id="ModernLandingPage.ecoFriendlyDesc" 
                    defaultMessage="From beginners to experts, find the tools you need to complete any project."
                  />
                </p>
              </div>
              <div className={css.featureCard}>
                <div className={css.featureImage}>
                  <img 
                    src="/static/images/garden-diy.png" 
                    alt="Garden DIY" 
                    className={css.featureImageSrc}
                  />
                </div>
                <h3 className={css.featureTitle}>
                  <FormattedMessage 
                    id="ModernLandingPage.community" 
                    defaultMessage="Garden DIY"
                  />
                </h3>
                <p className={css.featureDescription}>
                  <FormattedMessage 
                    id="ModernLandingPage.communityDesc" 
                    defaultMessage="Transform your outdoor space with professional garden tools available for rent."
                  />
                </p>
              </div>
              <div className={css.featureCard}>
                <div className={css.featureImage}>
                  <img 
                    src="/static/images/shed-to-sharing.png" 
                    alt="Shed to Sharing" 
                    className={css.featureImageSrc}
                  />
                </div>
                <h3 className={css.featureTitle}>
                  <FormattedMessage 
                    id="ModernLandingPage.convenient" 
                    defaultMessage="Shed to Sharing"
                  />
                </h3>
                <p className={css.featureDescription}>
                  <FormattedMessage 
                    id="ModernLandingPage.convenientDesc" 
                    defaultMessage="Turn your unused tools into income by sharing them with the community."
                  />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Carousel Section */}
        <section className={css.articlesSection}>
          <div className={css.container}>
            <h2 className={css.sectionTitle}>
              <FormattedMessage 
                id="ModernLandingPage.latestArticles" 
                defaultMessage="Featured Projects & Tips"
              />
            </h2>
            <div className={css.carouselContainer}>
              <div className={css.carouselWrapper}>
                <div 
                  className={css.carouselTrack}
                  style={{
                    transform: `translateX(-${currentSlide * (100 / cardsPerView)}%)`
                  }}
                >
                  {localCarouselImages.map((item, index) => (
                    <div key={index} className={css.carouselSlide}>
                      <div className={css.articleCard}>
                        <div className={css.articleImage}>
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className={css.articleImageSrc}
                          />
                        </div>
                        <div className={css.articleContent}>
                          <h3 className={css.articleTitle}>
                            {item.title}
                          </h3>
                          <p className={css.articleDescription}>
                            {item.description}
                          </p>
                          <NamedLink name={item.link.includes('/s') ? 'SearchPage' : 'NewListingPage'} className={css.articleLink}>
                            Learn More
                          </NamedLink>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Carousel Navigation */}
              {localCarouselImages.length > cardsPerView && (
                <>
                  <button 
                    className={css.carouselArrow} 
                    onClick={prevSlide}
                    aria-label="Previous articles"
                    disabled={currentSlide === 0}
                  >
                    ‹
                  </button>
                  <button 
                    className={css.carouselArrow} 
                    onClick={nextSlide}
                    aria-label="Next articles"
                    disabled={currentSlide >= Math.ceil(localCarouselImages.length / cardsPerView) - 1}
                  >
                    ›
                  </button>
                  
                  {/* Carousel Dots */}
                  <div className={css.carouselDots}>
                    {Array.from({ length: Math.ceil(localCarouselImages.length / cardsPerView) }, (_, index) => (
                      <button
                        key={index}
                        className={`${css.carouselDot} ${index === currentSlide ? css.carouselDotActive : ''}`}
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
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

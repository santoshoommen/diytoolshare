import React, { useState, useEffect } from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { 
  NamedLink, 
  LayoutSingleColumn, 
  IconSearch, 
  IconEdit, 
  IconLocation, 
  IconKeys, 
  IconAdd, 
  IconCheckmark 
} from '../../components';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import css from './ModernLandingPage.module.css';

const ModernLandingPage = ({ consoleContent }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);
  
  // Extract content from console data
  const sections = consoleContent?.sections || [];
  console.log('sections', sections);
  
  // Treat first section as hero section (regardless of sectionType)
  const heroSection = sections[0];
  const heroBackgroundImage = heroSection?.appearance?.backgroundImage?.attributes?.variants?.scaled1200?.url;
  const heroTitle = heroSection?.title?.content;
  const heroDescription = heroSection?.description?.content;
  const heroCallToAction = heroSection?.callToAction;
  
  // Find columns section for services
  const columnsSection = sections.find(section => section.sectionType === 'columns');
  const serviceBlocks = columnsSection?.blocks || [];
  
  // Find carousel section for articles
  const carouselSection = sections.find(section => section.sectionType === 'carousel');
  const carouselBlocks = carouselSection?.blocks || [];
  
  // Extract carousel images from console data
  const carouselImages = carouselBlocks.map(block => ({
    image: block.media?.image?.attributes?.variants?.landscape800?.url || 
           block.media?.image?.attributes?.variants?.landscape1200?.url,
    title: block.title?.content || '',
    description: block.text?.content || '',
    link: block.media?.link?.href || block.callToAction?.href || '/s',
    alt: block.media?.alt || block.title?.content || '',
    isExternalLink: !!(block.media?.link?.href || block.callToAction?.href)
  })).filter(item => item.image); // Only include items with valid images


  




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
    if (carouselImages.length > cardsPerView) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          const maxSlides = Math.ceil(carouselImages.length / cardsPerView) - 1;
          return prev >= maxSlides ? 0 : prev + 1;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselImages.length, cardsPerView]);

  const nextSlide = () => {
    const maxSlides = Math.ceil(carouselImages.length / cardsPerView) - 1;
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
            backgroundImage: heroBackgroundImage ? `url(${heroBackgroundImage})` : `url('/static/images/hero.png')`,
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
                    {heroCallToAction?.href && heroCallToAction?.content ? (
                      <NamedLink name="SearchPage" className={css.primaryButton}>
                        {heroCallToAction.content}
                      </NamedLink>
                    ) : (
                      <NamedLink name="SearchPage" className={css.primaryButton}>
                        <FormattedMessage 
                          id="ModernLandingPage.findTools" 
                          defaultMessage="Find Tools"
                        />
                      </NamedLink>
                    )}
                    <NamedLink name="NewListingPage" className={css.secondaryButton}>
                      <FormattedMessage 
                        id="ModernLandingPage.listTools" 
                        defaultMessage="List Your Tools"
                      />
                    </NamedLink>
                  </div>
                </div>
                <div className={css.heroVisual}>
                  <div className={css.heroIconGrid}>
                    <div className={css.iconCard}>
                      <div className={css.iconPlaceholder}>
                        <IconSearch className={css.toolIcon} />
                      </div>
                      <p className={css.iconCaption}>Find Tools</p>
                    </div>
                    <div className={css.iconCard}>
                      <div className={css.iconPlaceholder}>
                        <IconEdit className={css.toolIcon} />
                      </div>
                      <p className={css.iconCaption}>DIY Projects</p>
                    </div>
                    <div className={css.iconCard}>
                      <div className={css.iconPlaceholder}>
                        <IconLocation className={css.toolIcon} />
                      </div>
                      <p className={css.iconCaption}>Local Tools</p>
                    </div>
                    <div className={css.iconCard}>
                      <div className={css.iconPlaceholder}>
                        <IconKeys className={css.toolIcon} />
                      </div>
                      <p className={css.iconCaption}>Secure Access</p>
                    </div>
                    <div className={css.iconCard}>
                      <div className={css.iconPlaceholder}>
                        <IconAdd className={css.toolIcon} />
                      </div>
                      <p className={css.iconCaption}>List Tools</p>
                    </div>
                    <div className={css.iconCard}>
                      <div className={css.iconPlaceholder}>
                        <IconCheckmark className={css.toolIcon} />
                      </div>
                      <p className={css.iconCaption}>Quality Assured</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Icons Section */}
        <section className={css.featureIcons}>
          <div className={css.container}>
            <div className={css.featureIconsGrid}>
              <div className={css.featureIconCard}>
                <div className={css.featureIconPlaceholder}>
                  <IconSearch className={css.featureIcon} />
                </div>
                <p className={css.featureIconCaption}>Find Tools</p>
              </div>
              <div className={css.featureIconCard}>
                <div className={css.featureIconPlaceholder}>
                  <IconEdit className={css.featureIcon} />
                </div>
                <p className={css.featureIconCaption}>DIY Projects</p>
              </div>
              <div className={css.featureIconCard}>
                <div className={css.featureIconPlaceholder}>
                  <IconLocation className={css.featureIcon} />
                </div>
                <p className={css.featureIconCaption}>Local Tools</p>
              </div>
              <div className={css.featureIconCard}>
                <div className={css.featureIconPlaceholder}>
                  <IconKeys className={css.featureIcon} />
                </div>
                <p className={css.featureIconCaption}>Secure Access</p>
              </div>
              <div className={css.featureIconCard}>
                <div className={css.featureIconPlaceholder}>
                  <IconAdd className={css.featureIcon} />
                </div>
                <p className={css.featureIconCaption}>List Tools</p>
              </div>
              <div className={css.featureIconCard}>
                <div className={css.featureIconPlaceholder}>
                  <IconCheckmark className={css.featureIcon} />
                </div>
                <p className={css.featureIconCaption}>Quality Assured</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Section - Use data from columns section */}
        <section className={css.quickActions}>
          <div className={css.container}>
            {columnsSection?.title?.content && (
              <h2 className={css.sectionTitle}>
                {columnsSection.title.content}
              </h2>
            )}
            {columnsSection?.description?.content && (
              <p className={css.sectionDescription}>
                {columnsSection.description.content}
              </p>
            )}
            <div className={css.actionsGrid}>
              {serviceBlocks.slice(0, 2).map((block, index) => (
                <div key={index} className={css.actionCard}>
                  <div className={css.actionImage}>
                    <img 
                      src={block.media?.image?.attributes?.variants?.square800?.url || 
                           block.media?.image?.attributes?.variants?.square400?.url || 
                           `/static/images/services-${index === 0 ? 'search-listings' : 'my-listings'}.png`} 
                      alt={block.media?.alt || block.title?.content || 'Service'} 
                      className={css.actionImageSrc}
                    />
                  </div>
                  <h3 className={css.actionTitle}>
                    {block.title?.content || (
                      <FormattedMessage 
                        id="ModernLandingPage.searchTools" 
                        defaultMessage="Search Tools"
                      />
                    )}
                  </h3>
                  <p className={css.actionDescription}>
                    {block.text?.content || (
                      <FormattedMessage 
                        id="ModernLandingPage.searchToolsDesc" 
                        defaultMessage="Browse thousands of tools available in your area"
                      />
                    )}
                  </p>
                  <NamedLink 
                    name={block.callToAction?.href?.includes('/s') ? 'SearchPage' : 'NewListingPage'} 
                    className={css.actionLink}
                  >
                    {block.callToAction?.content || (
                      <FormattedMessage 
                        id="ModernLandingPage.startSearch" 
                        defaultMessage="Start Searching"
                      />
                    )}
                  </NamedLink>
                </div>
              ))}
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

        {/* Articles Carousel Section - Use data from console */}
        <section className={css.articlesSection}>
          <div className={css.container}>
            <h2 className={css.sectionTitle}>
              {carouselSection?.title?.content || (
                <FormattedMessage 
                  id="ModernLandingPage.latestArticles" 
                  defaultMessage="Featured Projects & Tips"
                />
              )}
            </h2>
            {carouselSection?.description?.content && (
              <p className={css.sectionDescription}>
                {carouselSection.description.content}
              </p>
            )}
            <div className={css.carouselContainer}>
              <div className={css.carouselWrapper}>
                <div 
                  className={css.carouselTrack}
                  style={{
                    transform: `translateX(-${currentSlide * (100 / cardsPerView)}%)`
                  }}
                >
                  {carouselImages.map((item, index) => (
                    <div key={index} className={css.carouselSlide}>
                      <div className={css.articleCard}>
                        <div className={css.articleImage}>
                          {item.isExternalLink ? (
                            <a 
                              href={item.link}
                            >
                              <img 
                                src={item.image} 
                                alt={item.alt} 
                                className={css.articleImageSrc}
                              />
                            </a>
                          ) : (
                            <img 
                              src={item.image} 
                              alt={item.alt} 
                              className={css.articleImageSrc}
                            />
                          )}
                        </div>
                        <div className={css.articleContent}>
                          <h3 className={css.articleTitle}>
                            {item.isExternalLink ? (
                              <a 
                                href={item.link} 
                                className={css.articleTitleLink}
                              >
                                {item.title}
                              </a>
                            ) : (
                              item.title
                            )}
                          </h3>
                          <p className={css.articleDescription}>
                            {item.description ? (
                              item.description.includes('[') && item.description.includes('](') ? (
                                // Handle markdown-style links in description
                                item.description.split(/(\[.*?\]\(.*?\))/).map((part, index) => {
                                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                  if (linkMatch) {
                                    const [, linkText, linkUrl] = linkMatch;
                                    return (
                                      <a 
                                        key={index}
                                        href={linkUrl} 
                                        className={css.articleDescriptionLink}
                                      >
                                        {linkText}
                                      </a>
                                    );
                                  }
                                  return part;
                                })
                              ) : (
                                item.description
                              )
                            ) : null}
                          </p>
                          {item.isExternalLink ? (
                            <a 
                              href={item.link} 
                              className={css.articleLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Learn More
                            </a>
                          ) : (
                            <NamedLink 
                              name={item.link.includes('/s') ? 'SearchPage' : 'NewListingPage'} 
                              className={css.articleLink}
                            >
                              Learn More
                            </NamedLink>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Carousel Navigation */}
              {carouselImages.length > cardsPerView && (
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
                    disabled={currentSlide >= Math.ceil(carouselImages.length / cardsPerView) - 1}
                  >
                    ›
                  </button>
                  
                  {/* Carousel Dots */}
                  <div className={css.carouselDots}>
                    {Array.from({ length: Math.ceil(carouselImages.length / cardsPerView) }, (_, index) => (
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

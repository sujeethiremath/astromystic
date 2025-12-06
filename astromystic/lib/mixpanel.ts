import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel only on the client side
if (typeof window !== 'undefined') {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '', {
    debug: process.env.NODE_ENV === 'development', // Show logs in dev mode
    track_pageview: true, // Automatically track page views
    persistence: 'localStorage', // Persist user identity across sessions
  });
}

// Helper to track events safely
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    try {
      mixpanel.track(name, properties);
    } catch (error) {
      // console.error('Mixpanel Error:', error);
    }
  }
};

// Helper to identify users (call this after login)
export const identifyUser = (userId: string, email?: string, name?: string) => {
  if (typeof window !== 'undefined') {
    mixpanel.identify(userId);
    if (email || name) {
      mixpanel.people.set({
        $email: email,
        $name: name,
        last_login: new Date(),
      });
    }
  }
};

// Helper to reset user (call this on logout)
export const resetUser = () => {
  if (typeof window !== 'undefined') {
    mixpanel.reset();
  }
};

export default mixpanel;

import React from 'react';

// Icon SVGs
const ArticleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
  </svg>
);

const BookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const PodcastIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4 ml-1 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity mt-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

interface ResourceItem {
  title: string;
  url: string;
  type: 'Article' | 'Book' | 'Podcast';
}

const resources: ResourceItem[] = [
  {
    title: 'What makes adults choose to learn: Factors that stimulate or prevent adults from learning',
    url: 'https://journals.sagepub.com/doi/full/10.1177/14779714231169684',
    type: 'Article',
  },
  {
    title: 'The Role of Adult Learning and Education in Community Development: A Case Study of New York',
    url: 'https://www.researchgate.net/profile/Michael-Edwards-Fapohunda/publication/387946599_The_Role_of_Adult_Learning_and_Education_in_Community_Development_A_Case_Study_of_New_York/links/678376212fcfd011cc66c30f/The-Role-of-Adult-Learning-and-Education-in-Community-Development-A-Case-Study-of-New-York.pdf',
    type: 'Article',
  },
  {
    title: 'Optimizing Spaced Repetition Schedule by Capturing the Dynamics of Memory',
    url: 'https://ieeexplore.ieee.org/abstract/document/10059206',
    type: 'Article',
  },
  {
    title: 'Learning Is A Sure Path To Happiness: Science Proves It',
    url: 'https://www.forbes.com/sites/tracybrower/2021/10/17/learning-is-a-sure-path-to-happiness-science-proves-it/',
    type: 'Article',
  },
  {
    title: 'Make It Stick: The Science of Successful Learning',
    url: 'https://www.amazon.com/Make-Stick-Science-Successful-Learning/dp/0674729013',
    type: 'Book',
  },
  {
    title: 'You can learn new things at any age, with Rachel Wu, PhD',
    url: 'https://www.apa.org/news/podcasts/speaking-of-psychology/lifelong-learning',
    type: 'Podcast',
  },
];

export default function ResourcesSection() {
  return (
    <div className="mt-24 pt-16 border-t border-gray-100">
      
      {/* Header formatted exactly like the Blog Header above it */}
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          Resources
        </h2>
        <p className="text-lg text-gray-600 mt-4">
          Smart people, good papers, fewer rabbit holes.
        </p>
      </div>

      {/* Grid formatted exactly like the Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resources.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="bg-white overflow-hidden">
              {/* Image proxy box matching BlogCard aspect-[16/10] */}
              <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg mb-4 bg-gray-50 flex items-center justify-center border border-gray-100">
                <div className="transform transition-transform duration-500 group-hover:scale-110">
                  {/* Subtle themed background with icons to look "rich" without needing JPG files */}
                  {item.type === 'Article' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
                  )}
                  {item.type === 'Book' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50"></div>
                  )}
                  {item.type === 'Podcast' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-50"></div>
                  )}

                  {item.type === 'Article' && <ArticleIcon className="w-16 h-16 text-blue-300 relative z-10" />}
                  {item.type === 'Book' && <BookIcon className="w-16 h-16 text-indigo-300 relative z-10" />}
                  {item.type === 'Podcast' && <PodcastIcon className="w-16 h-16 text-emerald-300 relative z-10" />}
                </div>
              </div>
              
              {/* Content matching BlogCard text layout */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-3">
                  {item.title} <ExternalLinkIcon />
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Resource &bull; {item.type}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Modern, clean CTA matching the site aesthetic rather than overpowering the blog UI */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left flex-1 border-l-4 border-blue-600 pl-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Have a paper, article, podcast or author you think we should add here?
            </h3>
            <p className="text-gray-600">
              We are always on the lookout for great resources on learning, memory, and cognitive science.
            </p>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <a href="mailto:contact@memsurf.com" className="block text-center bg-gray-900 text-white font-medium px-8 py-3 rounded-full hover:bg-black transition-colors">
              Send it our way
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

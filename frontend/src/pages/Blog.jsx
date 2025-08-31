import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import doc1 from '../assets/images/doc1.jpg';
import doc2 from '../assets/images/doc2.jpg';
import doc3 from '../assets/images/doc3.jpg';
import doc4 from '../assets/images/doc4.jpg';

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blog');
      const data = await response.json();
      setBlogPosts(data.posts || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header Section */}
      <div className="bg-[#23282f] py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="uppercase text-teal-400 text-xs sm:text-sm font-semibold tracking-widest mb-2">Our Blog</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">Medical Insights & Health News</h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            Stay informed with the latest medical research, health tips, and professional insights from our team of healthcare experts.
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading blog posts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-[#181d23] rounded-xl overflow-hidden shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 hover:scale-105 group">
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image ? `http://localhost:5000${post.image}` : doc1} 
                    alt={post.title} 
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    style={{ objectPosition: 'top center' }}
                  />
                  <div className="absolute top-3 left-3 bg-teal-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    {post.category}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-teal-500 text-white px-3 py-1 rounded text-sm font-semibold">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments || 0} Comments
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {post.author}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="text-teal-400 font-semibold text-sm hover:text-teal-300 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    Read More
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105">
          Load More Articles
        </button>
      </div>

      {/* Newsletter Section */}
      <div className="bg-[#23282f] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Stay Updated with Medical News</h2>
          <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest health tips, medical research updates, and wellness advice delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors duration-200"
            />
            <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog; 
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import doc1 from '../assets/images/doc1.jpg';
import doc2 from '../assets/images/doc2.jpg';
import doc3 from '../assets/images/doc3.jpg';
import doc4 from '../assets/images/doc4.jpg';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    fetchBlogPost();
    fetchRelatedPosts();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/blog/${slug}`);
      const data = await response.json();
      setPost(data.post);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blog');
      const data = await response.json();
      // Get 3 random posts excluding current one
      const filtered = data.posts.filter(p => p.slug !== slug);
      setRelatedPosts(filtered.slice(0, 3));
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Blog Post Not Found</h1>
          <p className="text-gray-400 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-[#23282f] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-teal-400 text-sm mb-4">
            <Link to="/blog" className="hover:text-teal-300 transition-colors">Blog</Link>
            <span>/</span>
            <span>{post.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {post.author}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(post.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.comments || 0} Comments
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readTime || '5 min read'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Featured Image */}
        <div className="bg-[#181d23] rounded-2xl overflow-hidden shadow-2xl mb-8">
          <img 
            src={post.image ? `http://localhost:5000${post.image}` : doc1} 
            alt={post.title} 
            className="w-full object-cover"
            style={{ 
              height: '52.5vh',
              objectPosition: 'top center'
            }}
          />
        </div>
        
        {/* Article Content */}
        <div className="bg-[#181d23] rounded-2xl p-8 lg:p-12 shadow-2xl mb-8">
          <div className="prose prose-invert max-w-none">
            <div className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-[#181d23] rounded-2xl p-8 shadow-2xl mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{post.author.split(' ')[1]}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{post.author}</h3>
              <p className="text-gray-400 text-lg">Medical Expert & Healthcare Professional</p>
              <p className="text-gray-500 mt-2">Specializing in {post.category} with years of experience in patient care and medical research.</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-[#181d23] rounded-2xl p-8 shadow-2xl mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.id} 
                  to={`/blog/${relatedPost.slug}`}
                  className="group block"
                >
                  <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                    <div className="relative mb-3">
                      <img 
                        src={relatedPost.image ? `http://localhost:5000${relatedPost.image}` : doc1} 
                        alt={relatedPost.title} 
                        className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 left-2 bg-teal-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {relatedPost.category}
                      </div>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-2 group-hover:text-teal-400 transition-colors duration-200 line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <p className="text-gray-400 text-xs line-clamp-2">{relatedPost.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link 
            to="/blog" 
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Article
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 
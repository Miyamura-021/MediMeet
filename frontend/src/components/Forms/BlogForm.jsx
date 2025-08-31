import React, { useState, useEffect } from 'react';

const BlogForm = ({ initialValues, onSubmit, loading, error, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: null,
    author: '',
    category: '',
    featured: false,
    readTime: '5 min read'
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        excerpt: initialValues.excerpt || '',
        content: initialValues.content || '',
        image: initialValues.image || null,
        author: initialValues.author || '',
        category: initialValues.category || '',
        featured: initialValues.featured || false,
        readTime: initialValues.readTime || '5 min read'
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories = [
    'Cardiology', 'Surgery', 'Fitness', 'Nutrition', 'Mental Health', 
    'Immunology', 'Neurology', 'Pediatrics', 'Oncology', 'General Health'
  ];

  const readTimeOptions = [
    '3 min read', '5 min read', '7 min read', '10 min read', '15 min read'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Blog Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors duration-200"
            placeholder="Enter blog post title"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Author *
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors duration-200"
            placeholder="Enter author name"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors duration-200"
          >
            <option value="" className="bg-gray-700 text-white">Select category</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-gray-700 text-white">{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Blog Image
          </label>
          <div className="relative">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="blog-image-upload"
            />
            <label
              htmlFor="blog-image-upload"
              className="w-full px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formData.image ? formData.image.name : 'Choose Image'}
            </label>
          </div>
          {formData.image && (
            <div className="mt-2 text-sm text-teal-400">
              Selected: {formData.image.name}
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Read Time
          </label>
          <select
            name="readTime"
            value={formData.readTime}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors duration-200"
          >
            {readTimeOptions.map(time => (
              <option key={time} value={time} className="bg-gray-700 text-white">{time}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-gray-300 text-sm font-medium">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-400 focus:ring-2"
            />
            Featured Post (will appear on homepage)
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Excerpt *
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors duration-200"
            placeholder="Enter a brief excerpt (will appear in blog cards)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="8"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors duration-200"
            placeholder="Enter the full blog post content"
          />
          <p className="text-gray-500 text-xs mt-1">
            You can use basic formatting. For better formatting, consider using HTML tags.
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              {initialValues ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {initialValues ? 'Update Blog Post' : 'Add Blog Post'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BlogForm; 
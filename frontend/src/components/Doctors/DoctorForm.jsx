import React, { useState } from 'react';

const defaultFields = {
  name: '',
  email: '',
  phone: '',
  photo: null,
  specialization: '',
  bio: '',
  about: '',
  address: '',
  certificates: ['', ''],
  social: { facebook: '', twitter: '', instagram: '' },
  featured: false,
};

const DoctorForm = ({ initialValues = {}, onSubmit, loading, error, onCancel }) => {
  const [fields, setFields] = useState({ ...defaultFields, ...initialValues });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFields((prev) => ({ ...prev, photo: files[0] }));
    } else if (name.startsWith('certificate')) {
      const idx = parseInt(name.replace('certificate', ''));
      const certs = [...fields.certificates];
      certs[idx] = value;
      setFields((prev) => ({ ...prev, certificates: certs }));
    } else if (name.startsWith('social.')) {
      const key = name.split('.')[1];
      setFields((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
    } else {
      setFields((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(fields);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="text" name="name" placeholder="Name" value={fields.name} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white" required />
      <input type="email" name="email" placeholder="Email" value={fields.email} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white" required />
      <input type="text" name="phone" placeholder="Phone" value={fields.phone} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white" />
      <input type="file" name="photo" accept="image/*" onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white" />
      <input type="text" name="specialization" placeholder="Specialization" value={fields.specialization} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white" />
      <textarea name="bio" placeholder="Bio" value={fields.bio} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white" />
      <textarea name="about" placeholder="About" value={fields.about} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white" />
      <input type="text" name="address" placeholder="Address" value={fields.address} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white" />
      <div className="flex gap-2">
        <input type="text" name="certificate0" placeholder="Certificate 1" value={fields.certificates[0]} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white flex-1" />
        <input type="text" name="certificate1" placeholder="Certificate 2" value={fields.certificates[1]} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white flex-1" />
      </div>
      <div className="flex gap-2">
        <input type="text" name="social.facebook" placeholder="Facebook URL" value={fields.social.facebook} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white flex-1" />
        <input type="text" name="social.twitter" placeholder="Twitter URL" value={fields.social.twitter} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white flex-1" />
        <input type="text" name="social.instagram" placeholder="Instagram URL" value={fields.social.instagram} onChange={handleChange} className="rounded p-2 bg-[#181d23] text-white flex-1" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="featured" checked={fields.featured} onChange={(e) => setFields(prev => ({ ...prev, featured: e.target.checked }))} className="rounded" />
        <label className="text-white text-sm">Featured Doctor (appears on Home page)</label>
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      {onCancel && <button type="button" className="mt-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded" onClick={onCancel}>Cancel</button>}
    </form>
  );
};

export default DoctorForm; 
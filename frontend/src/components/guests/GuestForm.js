import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuestContext } from '../../contexts/GuestContext';
import '../../styles/GuestForm.css';

const GuestForm = () => {
  const navigate = useNavigate();
  const { addGuest } = useContext(GuestContext);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    id_proof_type: 'passport',
    id_proof_number: '',
    date_of_birth: '',
    nationality: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.id_proof_type) {
      newErrors.id_proof_type = 'ID proof type is required';
    }
    
    if (!formData.id_proof_number.trim()) {
      newErrors.id_proof_number = 'ID number is required';
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    
    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setSubmitting(true);
    setSubmitError('');
    
    try {
      // Add guest using context instead of API call
      const newGuest = addGuest(formData);
      
      // Redirect to guest list with success message
      navigate('/guests', { 
        state: { message: 'Guest added successfully!' }
      });
    } catch (err) {
      console.error('Error creating guest:', err);
      setSubmitError('Failed to add guest. Please try again.');
      setSubmitting(false);
    }
  };
  
  return (
    <div className="guest-form-container">
      <h1>Add New Guest</h1>
      
      {submitError && (
        <div className="error-message">{submitError}</div>
      )}
      
      <form onSubmit={handleSubmit} className="guest-form">
        {/* Rest of your form remains the same */}
        <div className="form-section">
          <h2>Personal Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? 'error' : ''}
              />
              {errors.first_name && <div className="error-text">{errors.first_name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? 'error' : ''}
              />
              {errors.last_name && <div className="error-text">{errors.last_name}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <div className="error-text">{errors.phone}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth *</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={errors.date_of_birth ? 'error' : ''}
              />
              {errors.date_of_birth && <div className="error-text">{errors.date_of_birth}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="nationality">Nationality *</label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className={errors.nationality ? 'error' : ''}
              />
              {errors.nationality && <div className="error-text">{errors.nationality}</div>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Identification</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="id_proof_type">ID Type *</label>
              <select
                id="id_proof_type"
                name="id_proof_type"
                value={formData.id_proof_type}
                onChange={handleChange}
                className={errors.id_proof_type ? 'error' : ''}
              >
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="national_id">National ID</option>
                <option value="other">Other</option>
              </select>
              {errors.id_proof_type && <div className="error-text">{errors.id_proof_type}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="id_proof_number">ID Number *</label>
              <input
                type="text"
                id="id_proof_number"
                name="id_proof_number"
                value={formData.id_proof_number}
                onChange={handleChange}
                className={errors.id_proof_number ? 'error' : ''}
              />
              {errors.id_proof_number && <div className="error-text">{errors.id_proof_number}</div>}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/guests')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="submit-button"
          >
            {submitting ? 'Adding Guest...' : 'Add Guest'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestForm;
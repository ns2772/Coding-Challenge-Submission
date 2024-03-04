import React, { useEffect, useState } from 'react';
import Joi from 'joi';
import axios from 'axios';

const getSupervisors = async () => {
  const response = await axios.get('http://localhost:8080/api/supervisors');
  return response.data || [];
};

const postNotification = async (payload) => {
  return await axios.post('http://localhost:8080/api/submit', payload);
};

export default function NotificationForm() {
  const [supervisors, setSupervisors] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    Supervisor: {},
  });

  const [notifiedType, setNotifiedType] = useState({
    email: false,
    phone: false,
  });

  console.log('🚀 ~ NotificationForm ~ notifiedType:', notifiedType);
  useEffect(() => {
    const fetchSupervisors = async () => {
      const data = await getSupervisors();
      setSupervisors(data);
    };
    fetchSupervisors();
  }, []);

  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const schema = Joi.object({
    firstName: Joi.string()
      .regex(/^[A-Za-z]+$/)
      .required(),
    lastName: Joi.string()
      .regex(/^[A-Za-z]+$/)
      .required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .allow('')
      .optional(),
    phoneNumber: Joi.string().allow('').optional(),
    Supervisor: Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      phone: Joi.string().required(),
      identificationNumber: Joi.string().required(),
    }).required(),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Supervisor') {
      const selectedSupervisor = supervisors.find(
        (supervisor) => supervisor.id === value
      );
      if (selectedSupervisor) {
        setFormData({ ...formData, [name]: selectedSupervisor });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { error } = schema.validate(formData);
    if (error) {
      setFormErrors({ error: error.details[0].message });
      return;
    }

    console.log('Form data:', formData);
    postNotification(formData)
      .then(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          Supervisor: {},
        });
        setFormErrors({});
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 10000);
      })
      .catch((err) => {
        setFormErrors({ error: err.message });
      });
  };

  return (
    <div className='h-screen bg-blue-200'>
      <h1 className='text-center font-semibold bg-gray-700 text-4xl py-5 text-white'>
        Notification Form
      </h1>
      <div className='max-w-2xl mx-auto mt-8 bg-white rounded p-6 shadow-md'>
        <form onSubmit={handleSubmit}>
          <div className='flex justify-between gap-10'>
            <div className='mb-4 flex-1'>
              <label
                htmlFor='firstName'
                className='block text-sm font-semibold mb-1'
              >
                First Name:
              </label>
              <input
                type='text'
                id='firstName'
                name='firstName'
                value={formData.firstName}
                onChange={handleInputChange}
                className='w-full border rounded px-3 py-2'
              />
            </div>
            <div className='mb-4 flex-1'>
              <label
                htmlFor='lastName'
                className='block text-sm font-semibold mb-1'
              >
                Last Name:
              </label>
              <input
                type='text'
                id='lastName'
                name='lastName'
                value={formData.lastName}
                onChange={handleInputChange}
                className='w-full border rounded px-3 py-2'
              />
            </div>
          </div>
          <div className='mb-4'>
            <p>How would you prefer to be notified?</p>
            <div className='flex justify-between gap-10'>
              <div className='flex flex-col gap-2 flex-1'>
                <div className='space-x-2'>
                  <input
                    type='checkbox'
                    id='email'
                    onChange={(e) =>
                      setNotifiedType((notifiedType) => ({
                        ...notifiedType,
                        email: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor='email' className='text-sm font-semibold'>
                    Email:
                  </label>
                </div>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full border rounded px-3 py-2'
                  disabled={!notifiedType.email}
                />
              </div>
              <div className='flex flex-col gap-2 flex-1'>
                <div className='space-x-2'>
                  <input
                    type='checkbox'
                    id='phoneNumber'
                    onChange={(e) =>
                      setNotifiedType((notifiedType) => ({
                        ...notifiedType,
                        phone: e.target.checked,
                      }))
                    }
                  />
                  <label
                    htmlFor='phoneNumber'
                    className='text-sm font-semibold'
                  >
                    Phone Number:
                  </label>
                </div>
                <input
                  type='text'
                  name='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className='w-full border rounded px-3 py-2'
                  disabled={!notifiedType.phone}
                />
              </div>
            </div>
          </div>
          <div className='mb-10 flex flex-col items-center gap-2'>
            <label htmlFor='Supervisor' className='block text-sm font-semibold'>
              Supervisor:
            </label>
            <select
              className='w-1/3 px-2 py-1 border rounded'
              id='Supervisor'
              name='Supervisor'
              onChange={handleInputChange}
            >
              <option value={'SELECT'}>Select</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.id}>
                  {supervisor.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type='submit'
            className='block mx-auto bg-gray-700 text-white py-1 px-10 rounded-md hover:bg-blue-200 hover:text-gray-700'
          >
            Submit
          </button>
        </form>
        {formErrors.error && (
          <div className='text-red-500 text-center my-4'>
            {formErrors.error}
          </div>
        )}
        {success && (
          <div className='text-red-500 text-center my-4'>
            Submited Successfully
          </div>
        )}
      </div>
    </div>
  );
}

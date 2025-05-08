import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export default function FirebaseExample() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [newItem, setNewItem] = useState('');

  // Sign in anonymously on component mount
  useEffect(() => {
    const signIn = async () => {
      try {
        const userCredential = await signInAnonymously(auth);
        setUser(userCredential.user);
        console.log('Signed in anonymously:', userCredential.user.uid);
      } catch (error) {
        console.error('Error signing in:', error);
      }
    };
    
    signIn();
  }, []);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'items'));
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setData(items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add a new item to Firestore
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    try {
      const docRef = await addDoc(collection(db, 'items'), {
        name: newItem,
        createdAt: new Date(),
        userId: user ? user.uid : 'anonymous'
      });
      
      setData([...data, { 
        id: docRef.id, 
        name: newItem,
        createdAt: new Date(),
        userId: user ? user.uid : 'anonymous'
      }]);
      
      setNewItem('');
      console.log('Document added with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firebase Integration Example</h2>
      
      {user ? (
        <p className="text-sm text-gray-600 mb-4">
          Signed in anonymously as: {user.uid.substring(0, 8)}...
        </p>
      ) : (
        <p className="text-sm text-gray-600 mb-4">Not signed in</p>
      )}
      
      <form onSubmit={handleAddItem} className="mb-4 flex">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item"
          className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </form>
      
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div>
          <h3 className="font-semibold mb-2">Items from Firestore:</h3>
          {data.length === 0 ? (
            <p className="text-gray-500">No items found. Add your first item!</p>
          ) : (
            <ul className="list-disc pl-5">
              {data.map((item) => (
                <li key={item.id} className="mb-1">
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

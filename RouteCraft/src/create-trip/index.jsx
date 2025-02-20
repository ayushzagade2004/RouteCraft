import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '@/constants/options';
import { chatSession } from '@/service/AIMODEL';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddressSearch from '../components/AddressSearch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios'; // Correct import
import { doc, setDoc } from "firebase/firestore";
import { Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CreateTrip() {
  const [formData, setFormData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Fixed typo here

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const login = useGoogleLogin({
    onSuccess: (codeResp) => {
      console.log('Google Login Success:', codeResp);
      GetUserProfile(codeResp);
    },
    onError: (error) => {
      console.log('Google Login Error:', error);
    },
  });

  const OnGenerateTrip = async () => {
    const user = localStorage.getItem('user'); 

    if (!user) {
      setOpenDialog(true);
      return;
    }

    if (!formData?.location || !formData?.noOfDays || !formData?.budget || !formData?.traveller) {
      toast("Please fill all the details!");
      return;
    }

    if (formData?.noOfDays > 15) {
      toast("The maximum number of days is 15. Please choose a trip duration of 15 days or less.");
      return;
    }

    const FINAL_PROMPT = AI_PROMPT
      .replace('location', formData?.location)
      .replace('{totalDays}', formData?.noOfDays)
      .replace('{traveller}', formData?.traveller)
      .replace('{budget}', formData?.budget);

    console.log(FINAL_PROMPT);

    const result = await chatSession.sendMessage(FINAL_PROMPT);

    console.log(result?.response?.text());
  };

  const renderOptions = (options, type) => (
    options.map((item, index) => (
      <div
        key={index}
        onClick={() => handleInputChange(type, item.title || item.people)}
        className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${formData[type] === (item.title || item.people) ? 'shadow-lg border-black' : ''}`}
      >
        <h2 className='text-4xl'>{item.icon}</h2>
        <h2 className='font-bold text-lg'>{item.title || item.people}</h2>
        <h2 className='text-sm text-gray-500'>{item.desc}</h2>
      </div>
    ))
  );

  const SaveAItrip = async (TripData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const docId = Date.now().toString();
  
    await setDoc(doc(Database,"AITrips", docId), {
      userSelection: formData,
      tripData: JSON.parse(TripData),
      userEmail:user?.email,
      id:docId
    });
    setLoading(false);
    navigate('/view-trip/'+docId); // Fixed typo here
  };

  const GetUserProfile = (tokenInfo) => 
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'application/json',
      },
    })
    .then((resp) => {
      console.log(resp);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false); 
      OnGenerateTrip(); 
    })
    .catch((err) => {
      console.log('Error fetching user data:', err);
      toast('Failed to fetch user profile. Please try again.');
    });

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10'>
      <h2 className='font-bold text-3xl'>Tell us your travel preferences 🏕️🌲</h2>
      <p className='mt-3 text-gray-500 text-xl'>
        Just provide some basic information, and our wellness recommender will generate a customized itinerary based on your preferences.
      </p>

      <div>
        <div className='mt-20 flex-4 flex-col gap-9'>
          <h2 className='text-xl my-3 font-medium'>What is the destination of choice?</h2>
          <AddressSearch
            onSelect={(value) => {
              if (value) {
                handleInputChange('location', value);
              } else {
                toast("Invalid location. Please select a valid place.");
              }
            }}
          />
        </div>

        <div className='mt-12 flex-col gap-9'>
          <h2 className='text-xl my-3 font-medium'>How many days are you planning for your trip?</h2>
          <Input
            placeholder={'Ex: 4'} type="number"
            onChange={(e) => handleInputChange('noOfDays', e.target.value)}
          />
        </div>
      </div>

      <div>
        <h2 className='text-xl my-3 font-medium'>What is Your Budget?</h2>
        <div className='grid grid-cols-3 gap-5 mt-5'>
          {renderOptions(SelectBudgetOptions, 'budget')}
        </div>
      </div>

      <div>
        <h2 className='text-xl my-3 font-medium'>Who do you plan on traveling with on your next adventure?</h2>
        <div className='grid grid-cols-3 gap-5 mt-5'>
          {renderOptions(SelectTravelesList, 'traveller')}
        </div>
      </div>

      <div className='my-10 justify-end flex'>
        <Button onClick={OnGenerateTrip}>Generate Trip</Button>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <img src="/logo.svg" width="200" height="100" alt="Logo" />
            <h2 className='font-bold text-lg mt-7'>Sign In With Google</h2>
            <p>Sign in to the App with Google authentication securely</p>
            <Button onClick={login} className="w-full mt-5 flex items-center gap-4">
              <FcGoogle className='h-7 w-7'/>
              Sign in with Google
            </Button>
          </DialogHeader>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;

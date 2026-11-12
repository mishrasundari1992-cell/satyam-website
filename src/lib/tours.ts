export const whatsapp = (destination = 'a customized pilgrimage') => `https://wa.me/919628568807?text=${encodeURIComponent(`Namaste! I would like to enquire about ${destination}. Please help me plan my yatra.`)}`;
export const destinations = [
 { name: 'Varanasi', state: 'Uttar Pradesh', note: 'Where every ghat tells a timeless story.', image: '/images/varanasi.webp', tag: 'THE ETERNAL CITY', days: '3 days / 2 nights' },
 { name: 'Kedarnath', state: 'Uttarakhand', note: 'A sacred calling, high in the Himalayas.', image: '/images/kedarnath.webp', tag: 'HIMALAYAN PILGRIMAGE', days: '5 days / 4 nights' },
 { name: 'Ayodhya', state: 'Uttar Pradesh', note: 'Follow the footsteps of faith by the Saryu.', image: '/images/ayodhya-saryu.webp', tag: 'THE LAND OF SHRI RAM', days: '2 days / 1 night' },
 { name: 'Rishikesh', state: 'Uttarakhand', note: 'Find your quiet beside the sacred Ganga.', image: '/images/rishikesh.webp', tag: 'SPIRITUAL ESCAPES', days: '3 days / 2 nights' },
 { name: 'Mathura Vrindavan', state: 'Uttar Pradesh', note: 'Temple lanes filled with Krishna’s stories.', image: '/images/mathura.webp', tag: 'IN THE LAND OF KRISHNA', days: '3 days / 2 nights' },
 { name: 'Haridwar', state: 'Uttarakhand', note: 'An evening aarti. A moment to remember.', image: '/images/haridwar.webp', tag: 'GATEWAY TO THE DIVINE', days: '2 days / 1 night' },
 { name: 'Prayagraj', state: 'Uttar Pradesh', note: 'A meaningful pause at the sacred Sangam.', image: '/images/prayagraj.webp', tag: 'THE SACRED CONFLUENCE', days: '2 days / 1 night' },
 { name: 'Char Dham', state: 'Uttarakhand', note: 'Four sacred shrines. One extraordinary journey.', image: '/images/himalayas.webp', tag: 'A JOURNEY OF DEVOTION', days: '11 days / 10 nights' },
];

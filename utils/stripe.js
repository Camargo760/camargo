import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe('pk_test_51P2GkSSEzW86D25YUkzW9QoZE31ODA3vRCoQpwmKlue7nrsuj7MI0MVD5w8oVUXwsSYhjbV7Xvq2iNu12Mi6vpjQ00a8DAondY');
  }
  return stripePromise;
};
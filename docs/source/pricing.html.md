---
title: Pricing
layout: documentation
---

## Pricing

By [signing up](https://www.algolia.com/users/sign_up/places), you can create a free Places app and access your API keys.

<table class="rate-limits">
  <thead>
    <tr>
      <th>1,000 requests / day</th>
      <th>100,000 requests<br /> / month</th>
      <th>After free tiers</th>
      <th>Need more?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <p>Free</p>
      </td>
      <td>
        <p>Free, requires authentication</p>
        <p><a href="https://www.algolia.com/users/sign_up/places">Sign up</a></p>
      </td>
      <td>
        <p>$0.40 per 1,000 requests</p>
        <p><a href="https://www.algolia.com/users/sign_up/places">Sign up</a></p>
      </td>
      <td>
        <p>Up to Unlimited</p>
        <p><a href="contact.html">Contact us</a></p>
      </td>
    </tr>
  </tbody>
</table>

## Rate limits

The Algolia Places API enforces 30 queries per second. <a href="contact.html">Contact us</a> if you need more.

If you're calling the API from your backend, the rate-limits computation is then based on the source IP.

If you are using the places.js library, you will receive a [`limit` event](documentation.html#api-events-limit) on the places.js instance when you reach your current rate limit.

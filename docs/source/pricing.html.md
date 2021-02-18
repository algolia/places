---
title: Pricing
layout: documentation
---

## Pricing

Algolia Places is being sunset. It is not possible to sign up anymore.

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
      </td>
      <td>
        <p>$0.40 per 1,000 requests</p>
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

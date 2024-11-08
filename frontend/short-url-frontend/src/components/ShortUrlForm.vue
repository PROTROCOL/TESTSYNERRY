<!-- src/components/ShortUrlForm.vue -->
<template>
  <div class="short-url-form">
    <h2>Generate Short URL and QR Code</h2>

    <!-- Input Field -->
    <input v-model="urlInput" type="text" placeholder="Enter a URL to shorten" class="url-input" />

    <!-- Button -->
    <button @click="generateShortUrl" class="submit-button">Generate</button>

    <!-- Display Results -->
    <div v-if="shortUrl" class="result">
      <p>Short URL: <a :href="shortUrl" target="_blank">{{ shortUrl }}</a></p>
      <img v-if="qrCode" :src="qrCode" alt="QR Code" class="qr-code" />
    </div>

    <!-- Error Message -->
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      urlInput: '',        // Holds the URL input by the user
      shortUrl: '',        // Short URL result from API
      qrCode: '',          // QR Code in Base64 format from API
      errorMessage: ''     // Error message if any issues arise
    };
  },
  methods: {
    async generateShortUrl() {
      this.shortUrl = '';
      this.qrCode = '';
      this.errorMessage = '';

      if (!this.urlInput) {
        this.errorMessage = 'Please enter a URL.';
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/shorten', {
          fullUrl: this.urlInput
        });

        this.shortUrl = response.data.shortUrl;
        this.qrCode = response.data.qrCode;
      } catch (error) {
        console.error(error);
        this.errorMessage = 'Failed to generate short URL and QR code.';
      }
    }
  }
};
</script>

<style scoped>
.short-url-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
}

.url-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
}

.submit-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #a05a45;
  margin-left: 10px;
  transition: all 1s ease-in-out;
}

.result {
  margin-top: 20px;
  text-align: center;
}

.qr-code {
  margin-top: 10px;
  max-width: 100%;
  height: auto;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>


http://localhost:8080
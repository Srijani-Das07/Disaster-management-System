const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Public', 'Government', 'Relief_Staff'], 
    default: 'Public' 
  },
  password: { type: String },
  isGuest: { type: Boolean, default: false },
  guestId: { type: String, unique: true, sparse: true },
  lastSyncTimestamp: { type: Date, default: Date.now },
   // ✅ Emergency Contacts
  emergencyContacts: {
    primary: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String }
    },
    secondary: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String }
    },
    medical: {
      name: { type: String },
      phone: { type: String },
      hospital: { type: String }
    }
  },
  permissions: {
    canUpdateCamps: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageAlerts: { type: Boolean, default: false }
  },
  offlineData: {
    cachedCamps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCenter' }],
    lastOfflineAccess: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'Relief_Staff':
        this.permissions.canUpdateCamps = true;
        break;
      case 'Government':
        this.permissions.canUpdateCamps = true;
        this.permissions.canViewAnalytics = true;
        this.permissions.canManageAlerts = true;
        break;
      default:
        // Public user - no special permissions
        break;
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
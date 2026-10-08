/** Assets */
import IMG_LIGHT from "../assets/media/settings_theme_light.jpeg"
import IMG_DARK from "../assets/media/settings_theme_dark.jpeg"
import IMG_EN_US from "../assets/media/settings_locale_en_us.jpeg"
import IMG_EL_GR from "../assets/media/settings_locale_el_gr.jpeg"

export const features = {
  "profile": {
    "name": "personal_information",
    "categories": [
      {
        "name": "account_information",
        "icon": "id-card-outline",
        "route": "information",
      },
      {
        "name": "change_password",
        "icon": "key-outline",
        "route": "password",
      },
      {
        "name": "account_access",
        "icon": "shield-outline",
        "route": "access",
      },
      {
        "name": "download_an_archive_of_your_data",
        "icon": "cloud-download-outline",
        "route": "download",
      },
      {
        "name": "deactivate_your_account",
        "icon": "person-remove-outline",
        "route": "deactivate",
      }
    ]
  },
  "quick_buttons": {
    "left": {
      "name": "contact",
      "icon": "paper-plane-outline",
    },
    "middle": {
      "name": "notifications",
      "icon": "mail-unread-outline",
    },
    "right": {
      "name": "sign_out Out",
      "icon": "log-out-outline",
    }
  },
  "menu": [
    {
      "name": "preferences",
      "icon": "options-sharp",
      "chevron": true,
      "categories": [
        {
          "name": "change_theme",
          "icon": "contrast-outline",
          "route": "themes",
          "options": [
            {
              "name": "light",
              "image": IMG_LIGHT,
              "overlay": true
            },
            {
              "name": "dark",
              "image": IMG_DARK,
              "overlay": false
            }
          ]
        },
        {
          "name": "change_language",
          "icon": "language-outline",
          "route": "languages",
          "options": [
            {
              "name": "english",
              "image": IMG_EN_US,
              "overlay": false
            },
            {
              "name": "greek",
              "image": IMG_EL_GR,
              "overlay": true
            }
          ]
        }
      ]
    },
    {
      "name": "help",
      "icon": "help-buoy-outline",
      "chevron": true,
      "categories": [
        {
          "name": "help_center",
          "icon": "library-outline",
          "action": "help"
        },
        {
          "name": "report_issue",
          "icon": "bug-outline",
          "action": "issue"
        },
        {
          "name": "propose_feature",
          "icon": "bulb-outline",
          "action": "feature"
        }
      ]
    },
    {
      "name": "legal",
      "icon": "briefcase-outline",
      "chevron": true,
      "categories": [
        {
          "name": "terms_of_service",
          "icon": "book-outline",
          "action": "tos"
        },
        {
          "name": "privacy_policy",
          "icon": "lock-closed-outline",
          "action": "policy"
        }
      ]
    }
  ]
}
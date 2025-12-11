import type { DomainProfile as DomainProfileType } from '@/types/ens'
import type { FC } from 'react'
import { Card } from '../ui/Card'
import { AvatarDisplay } from './AvatarDisplay'

interface DomainProfileProps {
  profile: DomainProfileType
  domainName: string
}

const SocialIcon: FC<{ platform: string; url: string }> = ({ platform, url }) => {
  const icons: Record<string, string> = {
    twitter:
      'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    github:
      'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z',
    discord:
      'M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z',
    telegram:
      'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z',
    reddit:
      'M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 3.243.913.759 0 2.377-.056 3.243-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.808.73-1.125 0-2.26-.197-2.808-.73a.326.326 0 0 0-.194-.1z',
    linkedin:
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  }

  const getIconPath = (platform: string) => {
    return icons[platform.toLowerCase()] || ''
  }

  if (!icons[platform.toLowerCase()]) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label={`${platform} profile`}
    >
      <svg
        className="w-5 h-5 text-gray-700 dark:text-gray-300"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d={getIconPath(platform)} />
      </svg>
    </a>
  )
}

export const DomainProfile: FC<DomainProfileProps> = ({ profile, domainName }) => {
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('DomainProfile received:', {
      profile,
      domainName,
      hasAvatar: !!profile.avatar,
      hasWebsite: !!profile.website,
      socialLinks: profile.socialLinks,
    })
  }

  const socialLinks: Array<{ platform: string; url: string; value: string }> = []

  if (profile.socialLinks.twitter) {
    socialLinks.push({
      platform: 'Twitter',
      url: `https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`,
      value: profile.socialLinks.twitter,
    })
  }
  if (profile.socialLinks.github) {
    socialLinks.push({
      platform: 'GitHub',
      url: `https://github.com/${profile.socialLinks.github}`,
      value: profile.socialLinks.github,
    })
  }
  if (profile.socialLinks.discord) {
    socialLinks.push({
      platform: 'Discord',
      url: `https://discord.com/users/${profile.socialLinks.discord}`,
      value: profile.socialLinks.discord,
    })
  }
  if (profile.socialLinks.telegram) {
    socialLinks.push({
      platform: 'Telegram',
      url: `https://t.me/${profile.socialLinks.telegram.replace('@', '')}`,
      value: profile.socialLinks.telegram,
    })
  }
  if (profile.socialLinks.reddit) {
    socialLinks.push({
      platform: 'Reddit',
      url: `https://reddit.com/user/${profile.socialLinks.reddit}`,
      value: profile.socialLinks.reddit,
    })
  }
  if (profile.socialLinks.linkedin) {
    socialLinks.push({
      platform: 'LinkedIn',
      url: profile.socialLinks.linkedin,
      value: profile.socialLinks.linkedin,
    })
  }

  return (
    <Card title="Profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <AvatarDisplay
            avatar={profile.avatar}
            name={profile.displayName || domainName}
            size="lg"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.displayName || domainName}
            </h2>
            {profile.displayName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{domainName}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</label>
            <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.bio}</p>
          </div>
        )}

        {/* Contact Information */}
        {(profile.email || profile.phone || profile.location || profile.website) && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
              Contact Information
            </label>
            <div className="space-y-2">
              {profile.email && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                  <a
                    href={`tel:${profile.phone}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {profile.phone}
                  </a>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {profile.location}
                  </span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Website:</span>
                  <a
                    href={
                      profile.website.startsWith('http')
                        ? profile.website
                        : `https://${profile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 block">
              Social Media
            </label>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <SocialIcon key={link.platform} platform={link.platform} url={link.url} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

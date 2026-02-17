import React from 'react';

const About: React.FC = () => {
  const teamMembers = [
    { name: 'Luca', role: 'Project Manager' },
    { name: 'Minh', role: 'Tech Lead' },
    { name: 'Jason', role: 'Frontend Developer' },
    { name: 'Keeryn', role: 'Mobile Developer' },
    { name: 'Moon', role: 'Mobile Developer' },
    { name: 'Youssef', role: 'Frontend Developer' },
    { name: 'Anne', role: 'Business & UI/UX' },
    { name: 'Rodolfo', role: 'Backend & AI' },
    { name: 'Omar', role: 'Backend Developer' },
  ];

  // Get initials from name
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Generate a consistent color based on name
  const getColor = (name: string) => {
    const colors = [
      '#4DC4FF', // Primary blue
      '#C9FAD6', // Mint green
      '#F8F7DE', // Cream
      '#60a5fa', // Light blue
      '#34d399', // Green
      '#a78bfa', // Purple
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <section id="about" className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-heading font-semibold text-white mb-4">
            About Us
          </h2>
          <p className="text-xl text-white/70 font-body max-w-2xl mx-auto">
            We're a passionate team dedicated to revolutionizing networking events. 
            Meet the people behind Shatter.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 group"
              style={{ backgroundColor: 'rgba(27, 37, 58, 0.5)' }}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-heading font-semibold transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    backgroundColor: getColor(member.name),
                    color: ['#C9FAD6', '#F8F7DE'].includes(getColor(member.name)) ? '#1B253A' : '#ffffff'
                  }}
                >
                  {getInitials(member.name)}
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-xl font-heading font-semibold text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-white/60 font-body mt-1">
                    {member.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div
          className="mt-16 backdrop-blur-lg rounded-2xl p-8 text-center border-2"
          style={{ 
            backgroundColor: 'rgba(27, 37, 58, 0.5)',
            borderColor: '#C9FAD6'
          }}
        >
          <h3 className="text-2xl font-heading font-semibold text-white mb-4">
            Our Mission
          </h3>
          <p className="text-lg text-white/70 font-body max-w-3xl mx-auto">
            At Shatter, we believe networking should be engaging, memorable, and fun. 
            We're breaking down barriers and creating experiences that bring people together 
            in meaningful ways.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;

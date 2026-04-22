import { useQuery, useMutation } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';

export const useChatQuestions = (displayLocation) => {
  return useQuery({
    queryKey: ['chatQuestions', displayLocation],
    queryFn: () => chatService.getQuestions(displayLocation),
    enabled: !!displayLocation,
  });
};

export const useChatAnswer = () => {
  return useMutation({
    mutationFn: ({ questionId, language }) => chatService.getAnswer(questionId, language),
  });
};

export const useChatExpert = () => {
  return useMutation({
    mutationFn: (message) => chatService.askExpert(message),
  });
};
